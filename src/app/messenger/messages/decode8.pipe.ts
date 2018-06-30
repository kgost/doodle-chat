import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decode8'
})
export class Decode8Pipe implements PipeTransform {

  transform(value: string): string {
    return decodeURIComponent( escape( value ) );
  }

}
