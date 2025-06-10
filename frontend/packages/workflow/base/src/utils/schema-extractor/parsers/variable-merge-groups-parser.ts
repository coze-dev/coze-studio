import { type SchemaExtractorVariableMergeGroupsParser } from '../type';
import { expressionParser } from './expression-parser';
export const variableMergeGroupsParser: SchemaExtractorVariableMergeGroupsParser =
  mergeGroups =>
    mergeGroups.map(group => ({
      groupName: group.name,
      variables: expressionParser(group.variables),
    }));
