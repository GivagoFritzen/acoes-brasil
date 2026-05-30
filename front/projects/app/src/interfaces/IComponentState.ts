import { LoadingState } from './ILoadingState';
import { ErrorState } from './IErrorState';

export interface ComponentState extends LoadingState, ErrorState {
  isInitialized: boolean;
}
