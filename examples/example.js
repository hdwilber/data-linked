import { TypeManager, Types, MoreTypes } from '../src';
import getUserInstance from './user'
import _isEqual from 'lodash/isEqual'
import institution from './data.json'
import baseInstitutionSpec from './institution-spec'
import { createSavingInformation } from '../src/save'

const InstitutionSpec = {
  ...baseInstitutionSpec,
  dependencies: [{
    ...baseInstitutionSpec,
    _name: 'dependencies',
  }],
}

const InstitutionType = new TypeManager(InstitutionSpec)

//console.log(institution);
institution.dependencies = institution.dependencies.slice(0,1)
const modified = InstitutionType.fill(institution)
const original = InstitutionType.fill(institution)

console.log(original)
console.log(modified)
console.log('---------');

modified.name = 'new id'
//modified.phones = [1,23,44, '444444']
//modified.academicLevels = ['asdf', 'asdf2',]
//modified.logo.file = 'extra data'
//modified.categories = [{ id: '1' }, { id: '2', }]
//modified.head = { id: 'head1', }
//modified.geoLocation = {
  //point: null,
  //zoom: 12,
//}
//modified.dependencies[0].geoLocation = {
  //point: 'amigstasd',
  //zoom: 1000,
//}

//original.academicLevels = ['asdf', 'asdf2',]

const saveInfo = createSavingInformation(InstitutionSpec, modified, original)
console.log('SAVE INFO')
console.log(saveInfo)

InstitutionType.runSave(saveInfo, original).then(result => {
  console.log(result)
})
