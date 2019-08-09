import axios from 'axios';

import store from '@/store';

export default() => {
  if ( location.hostname === 'staging.jackthelast.com' ) {
    return axios.create({
      baseURL: `${ location.protocol }//staging-api.jackthelast.com/api`,
      headers: {
        'Authorization': store.state.token,
        'Content-Type': 'application/json',
      },
    });
  } else {
    return axios.create({
      baseURL: `${ location.protocol }//${ location.hostname }:8080/api`,
      headers: {
        'Authorization': store.state.token,
        'Content-Type': 'application/json',
      },
    });
  }
};
