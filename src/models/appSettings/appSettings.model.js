const BaseModel = require('../base/base.model')

class AppSettingsModel extends BaseModel {
  constructor (args, dependencies) {
    if (!args || !dependencies) {
      throw new Error('Required args and dependencies to build this entity')
    }

    super(dependencies)
    this.dependencies = dependencies

    const timestamp = (new Date()).getTime() + ''

    /* Base Properties */
    this.last_modification = { value: timestamp, type: dependencies.dal.types.timestamp }
    this.id = { value: args.id, type: dependencies.dal.types.bigserial, isPK: true }
    this.date_creation = { value: timestamp, type: dependencies.dal.types.timestamp }
    this.last_user_modification = { value: args.user_id, type: dependencies.dal.types.object }
    this.status = { value: args.status || AppSettingsModel.statuses.active, type: dependencies.dal.types.object }

    /* Custom fields */
    this.service_url = { value: args.service_url, type: dependencies.dal.types.string }
    this.service_method = { value: args.service_method, type: dependencies.dal.types.string }
    this.service_parameters = { value: args.service_parameters, type: dependencies.dal.types.string }
    this.provider = { value: args.provider, type: dependencies.dal.types.string }
    this.metadata = { value: args.metadata, type: dependencies.dal.types.string }
    this.is_enabled = { value: args.is_enabled, type: dependencies.dal.types.string }
  }

  // Return entity sanitized
  get sanitized () {
    return {
      id: this.id.value || this.id.type.default,
      service_url: this.service_url.value || this.service_url.type.default,
      service_method: this.service_method.value || this.service_method.type.default,
      service_parameters: this.service_parameters.value || this.service_parameters.type.default,
      provider: this.provider.value || this.provider.type.default,
      metadata: this.metadata.value || this.metadata.type.default,
      is_enabled: this.is_enabled.value || this.is_enabled.type.default
    }
  }

  get get () {
    return {
      id: this.id.value || this.id.type.default,
      date_creation: this.date_creation.value || this.date_creation.type.default,
      last_modification: this.last_modification.value || this.last_modification.type.default,
      last_user_modification: this.last_user_modification.value || this.last_user_modification.type.default,
      status: this.status.value || this.status.type.default,
      service_url: this.service_url.value || this.service_url.type.default,
      service_method: this.service_method.value || this.service_method.type.default,
      service_parameters: this.service_parameters.value || this.service_parameters.type.default,
      provider: this.provider.value || this.provider.type.default,
      metadata: this.metadata.value || this.metadata.type.default,
      is_enabled: this.is_enabled.value || this.is_enabled.type.default
    }
  }
}

AppSettingsModel.statuses = {
  inactive: { id: 1, service_url: 'inactive', title: 'Inactive' },
  active: { id: 2, service_url: 'active', title: 'Active' },
  deleted: { id: 3, service_url: 'deleted', title: 'Deleted' }
}

module.exports = AppSettingsModel
