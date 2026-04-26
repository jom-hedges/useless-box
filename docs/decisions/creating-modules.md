# Creating Modules

Modules are defined as a container for multiple resources that are used together. Modules can be viewed as lightweight abstraction layers, so infrastructure can be descriptive, rather than thinking directly in terms of objects. 

## Module structure
Re-usable modules are defined in terms of the same configuration language. 

Most common modules that I see across repositories include:
1. Inputs or variables - to accept values from the calling module 
2. Outpts - to return results to the calling module, which can populate arguments elsewhere 
3. Resources - to define one or more infrastructure objects that the module will manage

## When to write a module
This is something that I have struggled with on a personal, rather than technical level. Given the simplicity of the useless-box project, modules do not seem necessary at the moment. Hashicorp's docs state "a good module should raise the level of abstraction but describing a new concept" that is constructed from resource types offered by providers. Modules should represent high-level concepts. Creating modules just to create modules introduces unnecessary complexity.
