import type { ASTVisitor } from '../../language/visitor';
import type {
  ValidationContext,
  SDLValidationContext,
} from '../ValidationContext';
/**
 * Known type names
 *
 * A GraphQL document is only valid if referenced types (specifically
 * variable definitions and fragment conditions) are defined by the type schema.
 */
export declare function KnownTypeNamesRule(
  context: ValidationContext | SDLValidationContext,
): ASTVisitor;
