import { Pipe, PipeTransform } from '@angular/core';
import linkifyHtml from 'linkifyjs/html';

@Pipe({
  name: 'link'
})
export class LinkPipe implements PipeTransform {

  transform( value: any ): any {
    return linkifyHtml( value );
  }

}
