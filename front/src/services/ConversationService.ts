import Api from './Api';

import { Rest } from './Rest';

export default class ConversationService extends Rest {
  constructor() {
    super( 'conversations' );
  }
}
