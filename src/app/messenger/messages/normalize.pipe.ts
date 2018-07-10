import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'normalize'
})
export class NormalizePipe implements PipeTransform {

  transform(value: string): string {
    if ( !value ) {
      return '';
    }

    let result = '';

    while ( value.length > 0 ) {
      const firstImage = value.match( /<img[^>]*>/gm ) ? value.match( /<img[^>]*>/gm )[0] : null;
      const firstLink = value.match( /<a.*\/a>/gm ) ? value.match( /<a.*\/a>/gm )[0] : null;
      let imageIndex = firstImage ? value.indexOf( firstImage ) : -1;
      let linkIndex = firstLink ? value.indexOf( firstLink ) : -1;

      if ( imageIndex === -1 && linkIndex === -1 ) {
        result += '<span>' + this.escapeHtml( value ) + '</span>';
        value = '';
      } else if ( imageIndex === 0 ) {
        result += value.substr( 0, firstImage.length );
        value = value.substr( firstImage.length );
      } else if ( linkIndex === 0 ) {
        result += value.substr( 0, firstLink.length );
        value = value.substr( firstLink.length );
      } else {
        imageIndex = imageIndex === -1 ? linkIndex : imageIndex;
        linkIndex = linkIndex === -1 ? imageIndex : linkIndex;
        const leastIndex = imageIndex < linkIndex ? imageIndex : linkIndex;
        result += '<span>' + this.escapeHtml( value.substr( 0, leastIndex ) ) + '</span>';
        value = value.substr( leastIndex );
      }
    }

    result = result.replace( /\n/gm, '</span><br><span>' );

    return result;
  }


  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
