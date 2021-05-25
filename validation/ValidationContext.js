'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.ValidationContext =
  exports.SDLValidationContext =
  exports.ASTValidationContext =
    void 0;

var _kinds = require('../language/kinds.js');

var _visitor = require('../language/visitor.js');

var _TypeInfo = require('../utilities/TypeInfo.js');

/**
 * An instance of this class is passed as the "this" context to all validators,
 * allowing access to commonly useful contextual information from within a
 * validation rule.
 */
class ASTValidationContext {
  constructor(ast, onError) {
    this._ast = ast;
    this._fragments = undefined;
    this._fragmentSpreads = new Map();
    this._recursivelyReferencedFragments = new Map();
    this._onError = onError;
  }

  reportError(error) {
    this._onError(error);
  }

  getDocument() {
    return this._ast;
  }

  getFragment(name) {
    if (!this._fragments) {
      const fragments = (this._fragments = Object.create(null));

      for (const defNode of this.getDocument().definitions) {
        if (defNode.kind === _kinds.Kind.FRAGMENT_DEFINITION) {
          fragments[defNode.name.value] = defNode;
        }
      }
    }

    return this._fragments[name];
  }

  getFragmentSpreads(node) {
    let spreads = this._fragmentSpreads.get(node);

    if (!spreads) {
      spreads = [];
      const setsToVisit = [node];

      while (setsToVisit.length !== 0) {
        const set = setsToVisit.pop();

        for (const selection of set.selections) {
          if (selection.kind === _kinds.Kind.FRAGMENT_SPREAD) {
            // @ts-expect-error FIXME: TS Conversion
            spreads.push(selection);
          } else if (selection.selectionSet) {
            setsToVisit.push(selection.selectionSet);
          }
        }
      }

      this._fragmentSpreads.set(node, spreads);
    }

    return spreads;
  }

  getRecursivelyReferencedFragments(operation) {
    let fragments = this._recursivelyReferencedFragments.get(operation);

    if (!fragments) {
      fragments = [];
      const collectedNames = Object.create(null);
      const nodesToVisit = [operation.selectionSet];

      while (nodesToVisit.length !== 0) {
        const node = nodesToVisit.pop();

        for (const spread of this.getFragmentSpreads(node)) {
          const fragName = spread.name.value;

          if (collectedNames[fragName] !== true) {
            collectedNames[fragName] = true;
            const fragment = this.getFragment(fragName);

            if (fragment) {
              // @ts-expect-error FIXME: TS Conversion
              fragments.push(fragment);
              nodesToVisit.push(fragment.selectionSet);
            }
          }
        }
      }

      this._recursivelyReferencedFragments.set(operation, fragments);
    }

    return fragments;
  }
}

exports.ASTValidationContext = ASTValidationContext;

class SDLValidationContext extends ASTValidationContext {
  constructor(ast, schema, onError) {
    super(ast, onError);
    this._schema = schema;
  }

  getSchema() {
    return this._schema;
  }
}

exports.SDLValidationContext = SDLValidationContext;

class ValidationContext extends ASTValidationContext {
  constructor(schema, ast, typeInfo, onError) {
    super(ast, onError);
    this._schema = schema;
    this._typeInfo = typeInfo;
    this._variableUsages = new Map();
    this._recursiveVariableUsages = new Map();
  }

  getSchema() {
    return this._schema;
  }

  getVariableUsages(node) {
    let usages = this._variableUsages.get(node);

    if (!usages) {
      const newUsages = [];
      const typeInfo = new _TypeInfo.TypeInfo(this._schema);
      (0, _visitor.visit)(
        node,
        (0, _TypeInfo.visitWithTypeInfo)(typeInfo, {
          VariableDefinition: () => false,

          Variable(variable) {
            newUsages.push({
              node: variable,
              type: typeInfo.getInputType(),
              defaultValue: typeInfo.getDefaultValue(),
            });
          },
        }),
      );
      usages = newUsages;

      this._variableUsages.set(node, usages);
    }

    return usages;
  }

  getRecursiveVariableUsages(operation) {
    let usages = this._recursiveVariableUsages.get(operation);

    if (!usages) {
      usages = this.getVariableUsages(operation);

      for (const frag of this.getRecursivelyReferencedFragments(operation)) {
        usages = usages.concat(this.getVariableUsages(frag));
      }

      this._recursiveVariableUsages.set(operation, usages);
    }

    return usages;
  }

  getType() {
    return this._typeInfo.getType();
  }

  getParentType() {
    return this._typeInfo.getParentType();
  }

  getInputType() {
    return this._typeInfo.getInputType();
  }

  getParentInputType() {
    return this._typeInfo.getParentInputType();
  }

  getFieldDef() {
    return this._typeInfo.getFieldDef();
  }

  getDirective() {
    return this._typeInfo.getDirective();
  }

  getArgument() {
    return this._typeInfo.getArgument();
  }

  getEnumValue() {
    return this._typeInfo.getEnumValue();
  }
}

exports.ValidationContext = ValidationContext;
