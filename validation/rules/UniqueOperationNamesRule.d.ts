import type { ASTVisitor } from '../../language/visitor';
import type { ASTValidationContext } from '../ValidationContext';
/**
 * Unique operation names
 *
 * A GraphQL document is only valid if all defined operations have unique names.
 */
export declare function UniqueOperationNamesRule(
  context: ASTValidationContext,
): ASTVisitor;
