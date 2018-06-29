import { Pipe, PipeTransform } from '@angular/core';

import { AuthService } from '../../auth/auth.service';

@Pipe({
  name: 'dcrypt'
})
export class DcryptPipe implements PipeTransform {
  constructor(
    private authService: AuthService
  ) {}

  transform(value: string, key: string): string {
    return this.authService.decryptAes( value, key );
  }

}
