import { Pipe, PipeTransform } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Pipe({
  name: 'dcrypt'
})
export class DcryptPipe implements PipeTransform {

  transform(value: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt( value, key );
    return bytes.toString( CryptoJS.enc.Utf8 );
  }

}
