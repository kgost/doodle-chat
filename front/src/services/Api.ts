import axios from 'axios';

import store from '@/store';

export default() => {
  return axios.create({
    baseURL: `${ location.protocol }//${ location.hostname }:8080/api`,
    headers: {
      'Authorization': store.state.token,
      'Content-Type': 'application/json',
    },
  });
};
