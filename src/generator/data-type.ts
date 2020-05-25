import {
  Path as SwaggerPathConfig,
  Operation as SwaggerPathOperation,
  QueryParameter as SwaggerQueryParameter,
  Schema as SwaggerSchema,
} from "swagger-schema-official";

import { toPairs } from "lodash";
import { isArray } from "util";
import { ISimpleDict } from "../types";

let guessQueryNameType = (name: string) => {
  if (name.endsWith("Id")) {
    return "string";
  }
  if (name.endsWith("From") || name.endsWith("To")) {
    return "string";
  }
};

export let generateOptionsInterfaceCode = (parameters: SwaggerQueryParameter[], /** 允许重置为 any */ defaultType: string, definedQueryTypes: ISimpleDict) => {
  let pairsCode = parameters
    .map((p) => {
      if (p.type !== "string") {
        console.error("Not a query parameter", p);
        throw new Error("Not known how to handle query not in string");
      }
      let optionalMark = "";
      if (!p.required) {
        optionalMark = "?";
      }
      let doc = "";
      if (p.description != null && p.description !== "") {
        doc = `\n/** ${p.description} */\n`;
      }
      return `${doc}${p.name}${optionalMark}: ${definedQueryTypes[p.name] || guessQueryNameType(p.name) || defaultType || "string"},`;
    })
    .join("");
  return `{${pairsCode}}`;
};

export let generateDataInterfaceCode = (originalUrl: string, schema: SwaggerSchema) => {
  switch (schema.type) {
    case "string":
    case "number":
    case "boolean":
      return schema.type;
    case "integer":
      return "number";
    case "array":
      // TODO, 可能是数组, 但是类型统一的情况下只有一个
      let itemSchema = schema.items as SwaggerSchema;
      if (isArray(itemSchema)) {
        console.log(itemSchema);
        throw new Error("Unexpected array schema");
      }
      let itemCode = generateDataInterfaceCode(originalUrl, itemSchema);
      return `${itemCode}[]`;
    case "object":
      let requiredProps = schema.required;
      let pairsCode = toPairs(schema.properties).map(([property, propSchema]) => {
        let optionalMark = "?";
        if ((requiredProps || []).includes(property)) {
          optionalMark = "";
        }
        let doc = "";
        if (propSchema.description != null) {
          doc = `\n/** ${propSchema.description} */\n`;
        }
        return `${doc}${property}${optionalMark}: ${generateDataInterfaceCode(originalUrl, propSchema)}`;
      });
      return `{${pairsCode}}`;
    default:
      console.warn(originalUrl, "-- Unknown type:", schema);
      return schema.type;
  }
};
