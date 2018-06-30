import { Pipe, PipeTransform } from '@angular/core';

import * as twemoji from 'twemoji';

@Pipe({
  name: 'emojify'
})
export class EmojifyPipe implements PipeTransform {

  transform(value: string): string {
    return twemoji.parse( value );
  }

}
