class ModelBase {
  constructor (dependencies) {
    if (!dependencies) {
      throw new Error('Required dependencies to build this entity')
    }
    this.dependencies = dependencies
  }

  get getPropertiesAsCommas () {
    return (Object.keys(this.get)).join()
  }

  get getPropertiesAsBindings () {
    const keys = Object.keys(this.get)

    return (keys.map((_key, index) => `$${index + 1}`)).join()
  }

  get getValuesAsArray () {
    return (Object.values(this.get.value)).join()
  }

  get getPropertiesAsAssignment () {
    let keys = Object.keys(this.get)
    keys = keys.filter(key => this.get[key].value)
    return (keys.map(key => `${key}=${this.get[key].value}`)).join()
  }

  get getPropertiesAsTypes () {
    const keys = Object.keys(this.get)
    return keys.map(key => {
      if (this.get[key].isPK) {
        return `"${key}" ${this.get[key].type.sqlType} PRIMARY KEY`
      }

      return `"${key}" ${this.get[key].type.sqlType}`
    })
  }

  getPropertyAsReference ({ namespace, property }) {
    return `REFERENCES "${namespace}"."${this.get[property].reference.table}" ("${this.get[property].reference.property}")`
  }
}

module.exports = ModelBase
