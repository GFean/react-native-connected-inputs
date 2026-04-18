declare module 'react-native' {
  import type { ComponentType } from 'react';

  export type ReturnKeyTypeOptions =
    | 'default'
    | 'done'
    | 'emergency-call'
    | 'go'
    | 'google'
    | 'join'
    | 'next'
    | 'none'
    | 'previous'
    | 'route'
    | 'search'
    | 'send'
    | 'twitter'
    | 'yahoo';

  export const TextInput: ComponentType<any>;
}
