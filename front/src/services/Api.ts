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
      baseURL: `${ location.protocol }//10.96.1.1/api`,
      headers: {
        'Authorization': store.state.token,
        'Content-Type': 'application/json',
      },
    });
  }
};
