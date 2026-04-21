import { LoadingState } from './loading-state.interface';
import { ErrorState } from './error-state.interface';

export interface ComponentState extends LoadingState, ErrorState {
  isInitialized: boolean;
}
