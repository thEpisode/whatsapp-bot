const BaseModel = require('../base/base.model')

class AppModel extends BaseModel {
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
    this.status = { value: args.status || AppModel.statuses.active, type: dependencies.dal.types.object }

    /* Custom fields */
    this.name = { value: args.name, type: dependencies.dal.types.string }
    this.title = { value: args.title, type: dependencies.dal.types.string }
    this.version = { value: args.version, type: dependencies.dal.types.string }
    this.is_active = { value: args.is_active, type: dependencies.dal.types.string }
    this.settings = { value: args.settings, type: dependencies.dal.types.string }
    this.settings_id = { value: args.settings_id, type: dependencies.dal.types.string }
  }

  // Return entity sanitized
  get sanitized () {
    return {
      id: this.id.value || this.id.type.default,
      name: this.name.value || this.name.type.default,
      title: this.title.value || this.title.type.default,
      version: this.version.value || this.version.type.default,
      is_active: this.is_active.value || this.is_active.type.default,
      settings: this.settings.value || this.settings.type.default,
      settings_id: this.settings_id.value || this.settings_id.type.default
    }
  }

  get get () {
    return {
      id: this.id.value || this.id.type.default,
      date_creation: this.date_creation.value || this.date_creation.type.default,
      last_modification: this.last_modification.value || this.last_modification.type.default,
      last_user_modification: this.last_user_modification.value || this.last_user_modification.type.default,
      status: this.status.value || this.status.type.default,
      name: this.name.value || this.name.type.default,
      title: this.title.value || this.title.type.default,
      version: this.version.value || this.version.type.default,
      is_active: this.is_active.value || this.is_active.type.default,
      settings: this.settings.value || this.settings.type.default,
      settings_id: this.settings_id.value || this.settings_id.type.default
    }
  }
}

AppModel.statuses = {
  inactive: { id: 1, name: 'inactive', title: 'Inactive' },
  active: { id: 2, name: 'active', title: 'Active' },
  deleted: { id: 3, name: 'deleted', title: 'Deleted' }
}

module.exports = AppModel
