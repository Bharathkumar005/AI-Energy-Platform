variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
  default     = "rg-ai-energy-platform-asia"
}

variable "location" {
  description = "The Azure region to deploy to"
  type        = string
  default     = "Southeast Asia"
}

variable "prefix" {
  description = "Prefix for resource names"
  type        = string
  default     = "aienergy"
}

variable "azure_storage_connection_string" {
  description = "Connection string for the Azure Storage Account"
  type        = string
  sensitive   = true
}
