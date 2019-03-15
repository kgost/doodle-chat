import axios from 'axios';

import store from '@/store';

export default() => {
  if ( location.hostname === 'localhost' ) {
    return axios.create({
      baseURL: `http://${ location.hostname }:8080`,
      headers: {
        Authorization: store.state.token,
        'Content-Type': 'application/json',
      },
    });
  } else {
    return axios.create({
      baseURL: `http://${ location.hostname }`,
      headers: {
        Authorization: store.state.token,
        'Content-Type': 'application/json',
      },
    });
  }
};
