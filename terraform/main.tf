terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6.0"
    }
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
  }
}

data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

resource "random_string" "suffix" {
  length  = 5
  special = false
  upper   = false
}

# --- LOG ANALYTICS & APP INSIGHTS (Maintenance & Monitoring) ---
resource "azurerm_log_analytics_workspace" "law" {
  name                = "${var.prefix}-law-${random_string.suffix.result}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_application_insights" "appinsights" {
  name                = "${var.prefix}-appinsights-${random_string.suffix.result}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  workspace_id        = azurerm_log_analytics_workspace.law.id
  application_type    = "web"
}

# --- AZURE KEY VAULT (Security) ---
resource "azurerm_key_vault" "kv" {
  name                        = "${var.prefix}-kv-${random_string.suffix.result}"
  location                    = azurerm_resource_group.rg.location
  resource_group_name         = azurerm_resource_group.rg.name
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  sku_name                    = "standard"
  purge_protection_enabled    = false
}

# Access Policy for Terraform Deployer to create/read secrets
resource "azurerm_key_vault_access_policy" "terraform_user" {
  key_vault_id = azurerm_key_vault.kv.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_client_config.current.object_id

  secret_permissions = ["Get", "List", "Set", "Delete", "Purge", "Recover"]
}

# Store the connection string in Key Vault
resource "azurerm_key_vault_secret" "storage_conn_str" {
  name         = "StorageConnectionString"
  value        = var.azure_storage_connection_string
  key_vault_id = azurerm_key_vault.kv.id

  depends_on = [azurerm_key_vault_access_policy.terraform_user]
}

# --- CONTAINER REGISTRY ---
resource "azurerm_container_registry" "acr" {
  name                = "${var.prefix}acr${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

# --- APP SERVICE PLAN ---
resource "azurerm_service_plan" "app_plan" {
  name                = "${var.prefix}-plan"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "B1" # Basic tier
}

# --- BACKEND LINUX WEB APP ---
resource "azurerm_linux_web_app" "backend" {
  name                = "${var.prefix}-backend-${random_string.suffix.result}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.app_plan.id

  # Enable Managed Identity
  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = true
    application_stack {
      docker_image_name        = "ai-energy-backend:latest"
      docker_registry_url      = "https://${azurerm_container_registry.acr.login_server}"
      docker_registry_username = azurerm_container_registry.acr.admin_username
      docker_registry_password = azurerm_container_registry.acr.admin_password
    }
    cors {
      allowed_origins = ["*"]
    }
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "WEBSITES_PORT"                       = "8000"
    
    # Secure connection string via Key Vault Reference
    "AZURE_STORAGE_CONNECTION_STRING"     = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.storage_conn_str.id})"
    
    # App Insights settings
    "APPINSIGHTS_INSTRUMENTATIONKEY"        = azurerm_application_insights.appinsights.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.appinsights.connection_string
  }
}

# Access Policy for Web App Managed Identity to read secrets
resource "azurerm_key_vault_access_policy" "webapp_identity" {
  key_vault_id = azurerm_key_vault.kv.id
  tenant_id    = azurerm_linux_web_app.backend.identity[0].tenant_id
  object_id    = azurerm_linux_web_app.backend.identity[0].principal_id

  secret_permissions = ["Get", "List"]
}

# --- FRONTEND STATIC WEB APP ---
resource "azurerm_static_web_app" "frontend" {
  name                = "${var.prefix}-frontend-${random_string.suffix.result}"
  location            = "eastasia"
  resource_group_name = azurerm_resource_group.rg.name
  sku_tier            = "Free"
  sku_size            = "Free"
}
