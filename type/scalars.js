'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.isSpecifiedScalarType = isSpecifiedScalarType;
exports.specifiedScalarTypes =
  exports.GraphQLID =
  exports.GraphQLBoolean =
  exports.GraphQLString =
  exports.GraphQLFloat =
  exports.GraphQLInt =
    void 0;

var _inspect = require('../jsutils/inspect.js');

var _isObjectLike = require('../jsutils/isObjectLike.js');

var _kinds = require('../language/kinds.js');

var _printer = require('../language/printer.js');

var _GraphQLError = require('../error/GraphQLError.js');

var _definition = require('./definition.js');

// As per the GraphQL Spec, Integers are only treated as valid when a valid
// 32-bit signed integer, providing the broadest support across platforms.
//
// n.b. JavaScript's integers are safe between -(2^53 - 1) and 2^53 - 1 because
// they are internally represented as IEEE 754 doubles.
const MAX_INT = 2147483647;
const MIN_INT = -2147483648;

function serializeInt(outputValue) {
  const coercedValue = serializeObject(outputValue);

  if (typeof coercedValue === 'boolean') {
    return coercedValue ? 1 : 0;
  }

  let num = coercedValue;

  if (typeof coercedValue === 'string' && coercedValue !== '') {
    num = Number(coercedValue);
  }

  if (typeof num !== 'number' || !Number.isInteger(num)) {
    throw new _GraphQLError.GraphQLError(
      `Int cannot represent non-integer value: ${(0, _inspect.inspect)(
        coercedValue,
      )}`,
    );
  }

  if (num > MAX_INT || num < MIN_INT) {
    throw new _GraphQLError.GraphQLError(
      'Int cannot represent non 32-bit signed integer value: ' +
        (0, _inspect.inspect)(coercedValue),
    );
  }

  return num;
}

function coerceInt(inputValue) {
  if (typeof inputValue !== 'number' || !Number.isInteger(inputValue)) {
    throw new _GraphQLError.GraphQLError(
      `Int cannot represent non-integer value: ${(0, _inspect.inspect)(
        inputValue,
      )}`,
    );
  }

  if (inputValue > MAX_INT || inputValue < MIN_INT) {
    throw new _GraphQLError.GraphQLError(
      `Int cannot represent non 32-bit signed integer value: ${inputValue}`,
    );
  }

  return inputValue;
}

const GraphQLInt = new _definition.GraphQLScalarType({
  name: 'Int',
  description:
    'The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.',
  serialize: serializeInt,
  parseValue: coerceInt,

  parseLiteral(valueNode) {
    if (valueNode.kind !== _kinds.Kind.INT) {
      throw new _GraphQLError.GraphQLError(
        `Int cannot represent non-integer value: ${(0, _printer.print)(
          valueNode,
        )}`,
        valueNode,
      );
    }

    const num = parseInt(valueNode.value, 10);

    if (num > MAX_INT || num < MIN_INT) {
      throw new _GraphQLError.GraphQLError(
        `Int cannot represent non 32-bit signed integer value: ${valueNode.value}`,
        valueNode,
      );
    }

    return num;
  },
});
exports.GraphQLInt = GraphQLInt;

function serializeFloat(outputValue) {
  const coercedValue = serializeObject(outputValue);

  if (typeof coercedValue === 'boolean') {
    return coercedValue ? 1 : 0;
  }

  let num = coercedValue;

  if (typeof coercedValue === 'string' && coercedValue !== '') {
    num = Number(coercedValue);
  }

  if (typeof num !== 'number' || !Number.isFinite(num)) {
    throw new _GraphQLError.GraphQLError(
      `Float cannot represent non numeric value: ${(0, _inspect.inspect)(
        coercedValue,
      )}`,
    );
  }

  return num;
}

function coerceFloat(inputValue) {
  if (typeof inputValue !== 'number' || !Number.isFinite(inputValue)) {
    throw new _GraphQLError.GraphQLError(
      `Float cannot represent non numeric value: ${(0, _inspect.inspect)(
        inputValue,
      )}`,
    );
  }

  return inputValue;
}

const GraphQLFloat = new _definition.GraphQLScalarType({
  name: 'Float',
  description:
    'The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).',
  serialize: serializeFloat,
  parseValue: coerceFloat,

  parseLiteral(valueNode) {
    if (
      valueNode.kind !== _kinds.Kind.FLOAT &&
      valueNode.kind !== _kinds.Kind.INT
    ) {
      throw new _GraphQLError.GraphQLError(
        `Float cannot represent non numeric value: ${(0, _printer.print)(
          valueNode,
        )}`,
        valueNode,
      );
    }

    return parseFloat(valueNode.value);
  },
}); // Support serializing objects with custom valueOf() or toJSON() functions -
// a common way to represent a complex value which can be represented as
// a string (ex: MongoDB id objects).

exports.GraphQLFloat = GraphQLFloat;

function serializeObject(outputValue) {
  if ((0, _isObjectLike.isObjectLike)(outputValue)) {
    if (typeof outputValue.valueOf === 'function') {
      const valueOfResult = outputValue.valueOf();

      if (!(0, _isObjectLike.isObjectLike)(valueOfResult)) {
        return valueOfResult;
      }
    }

    if (typeof outputValue.toJSON === 'function') {
      return outputValue.toJSON();
    }
  }

  return outputValue;
}

function serializeString(outputValue) {
  const coercedValue = serializeObject(outputValue); // Serialize string, boolean and number values to a string, but do not
  // attempt to coerce object, function, symbol, or other types as strings.

  if (typeof coercedValue === 'string') {
    return coercedValue;
  }

  if (typeof coercedValue === 'boolean') {
    return coercedValue ? 'true' : 'false';
  }

  if (typeof coercedValue === 'number' && Number.isFinite(coercedValue)) {
    return coercedValue.toString();
  }

  throw new _GraphQLError.GraphQLError(
    `String cannot represent value: ${(0, _inspect.inspect)(outputValue)}`,
  );
}

function coerceString(inputValue) {
  if (typeof inputValue !== 'string') {
    throw new _GraphQLError.GraphQLError(
      `String cannot represent a non string value: ${(0, _inspect.inspect)(
        inputValue,
      )}`,
    );
  }

  return inputValue;
}

const GraphQLString = new _definition.GraphQLScalarType({
  name: 'String',
  description:
    'The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.',
  serialize: serializeString,
  parseValue: coerceString,

  parseLiteral(valueNode) {
    if (valueNode.kind !== _kinds.Kind.STRING) {
      throw new _GraphQLError.GraphQLError(
        `String cannot represent a non string value: ${(0, _printer.print)(
          valueNode,
        )}`,
        valueNode,
      );
    }

    return valueNode.value;
  },
});
exports.GraphQLString = GraphQLString;

function serializeBoolean(outputValue) {
  const coercedValue = serializeObject(outputValue);

  if (typeof coercedValue === 'boolean') {
    return coercedValue;
  }

  if (Number.isFinite(coercedValue)) {
    return coercedValue !== 0;
  }

  throw new _GraphQLError.GraphQLError(
    `Boolean cannot represent a non boolean value: ${(0, _inspect.inspect)(
      coercedValue,
    )}`,
  );
}

function coerceBoolean(inputValue) {
  if (typeof inputValue !== 'boolean') {
    throw new _GraphQLError.GraphQLError(
      `Boolean cannot represent a non boolean value: ${(0, _inspect.inspect)(
        inputValue,
      )}`,
    );
  }

  return inputValue;
}

const GraphQLBoolean = new _definition.GraphQLScalarType({
  name: 'Boolean',
  description: 'The `Boolean` scalar type represents `true` or `false`.',
  serialize: serializeBoolean,
  parseValue: coerceBoolean,

  parseLiteral(valueNode) {
    if (valueNode.kind !== _kinds.Kind.BOOLEAN) {
      throw new _GraphQLError.GraphQLError(
        `Boolean cannot represent a non boolean value: ${(0, _printer.print)(
          valueNode,
        )}`,
        valueNode,
      );
    }

    return valueNode.value;
  },
});
exports.GraphQLBoolean = GraphQLBoolean;

function serializeID(outputValue) {
  const coercedValue = serializeObject(outputValue);

  if (typeof coercedValue === 'string') {
    return coercedValue;
  }

  if (Number.isInteger(coercedValue)) {
    return String(coercedValue);
  }

  throw new _GraphQLError.GraphQLError(
    `ID cannot represent value: ${(0, _inspect.inspect)(outputValue)}`,
  );
}

function coerceID(inputValue) {
  if (typeof inputValue === 'string') {
    return inputValue;
  }

  if (typeof inputValue === 'number' && Number.isInteger(inputValue)) {
    return inputValue.toString();
  }

  throw new _GraphQLError.GraphQLError(
    `ID cannot represent value: ${(0, _inspect.inspect)(inputValue)}`,
  );
}

const GraphQLID = new _definition.GraphQLScalarType({
  name: 'ID',
  description:
    'The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.',
  serialize: serializeID,
  parseValue: coerceID,

  parseLiteral(valueNode) {
    if (
      valueNode.kind !== _kinds.Kind.STRING &&
      valueNode.kind !== _kinds.Kind.INT
    ) {
      throw new _GraphQLError.GraphQLError(
        'ID cannot represent a non-string and non-integer value: ' +
          (0, _printer.print)(valueNode),
        valueNode,
      );
    }

    return valueNode.value;
  },
});
exports.GraphQLID = GraphQLID;
const specifiedScalarTypes = Object.freeze([
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID,
]);
exports.specifiedScalarTypes = specifiedScalarTypes;

function isSpecifiedScalarType(type) {
  return specifiedScalarTypes.some(({ name }) => type.name === name);
}
