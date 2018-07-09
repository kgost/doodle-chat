import { Pipe, PipeTransform } from '@angular/core';
import linkifyHtml from 'linkifyjs/html';

@Pipe({
  name: 'link'
})
export class LinkPipe implements PipeTransform {

  transform( value: any ): any {
    if ( !value || value === '' ) {
      return '';
    }

    const matches = value.match( /https?:\/\/[^\s]+\.[^\s][^\s]+/gm );

    if ( matches ) {
      for ( let i = 0; i < matches.length; i++ ) {
        const linkified = linkifyHtml( matches[i] );
        value = value.substr( 0, value.indexOf( matches[i] ) ) +
          linkified + value.substr( value.indexOf( matches[i] ) + matches[i].length );
      }
    }

    return value;
  }

}
