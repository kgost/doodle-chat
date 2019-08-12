<template>
  <div>
    <div v-if="hasPush">
      <h2>Push Notifications</h2>
      <button v-on:click="enablePushNotifications" v-if="!subscribed">Enable</button>
      <button v-on:click="disablePushNotifications" v-if="subscribed">Disable</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

const Not: any = Notification;

@Component({
  components: {
  },
})
export default class Settings extends Vue {
  @Watch( 'subscribed' )
  private onSubscribeLoad( current ) {
    if ( current ) {
      this.enablePushNotifications();
    }
  }

  get hasPush() {
    return 'PushManager' in window;
  }

  get subscribed() {
    return store.state.user.pushSub;
  }

  private urlB64ToUint8Array( base64String ) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private requestPermission() {
    return new Promise( ( resolve, reject ) => {
      Notification.requestPermission().then( ( permission ) => {
        resolve( permission );
      } );
    } );
  }

  private submitSubscription() {
    const applicationServerKey = '';

    const options = {
      userVisibleOnly: true,
      applicationServerKey: this.urlB64ToUint8Array( 'BN7O7tZnRi9-RktuYKO8-IO7LKW9ttqDwRlYOcBfFKBU48B_SRQXq956VGP6jYK6KF1ABY9OkTik30nEPbPc9Mk' ),
    };

    navigator.serviceWorker.ready.then( ( registration: ServiceWorkerRegistration | void ) => {
      if ( registration ) {
        new Promise( ( resolve, reject ) => {
          registration.pushManager.getSubscription().then( ( subscription ) => {
            if ( subscription ) {
              subscription.unsubscribe().finally( () => {
                resolve();
              } );
            } else {
              resolve();
            }
          } ).catch( resolve );
        } ).then( () => {
          registration.pushManager.subscribe( options ).then( ( subscription: PushSubscription ) => {
            store.dispatch( 'setPushSub', subscription );
          } ).catch( ( err ) => {
            console.log( err.message )
            console.log( err );
          } );
        } );
      }
    } );
  }

  private enablePushNotifications() {
    if ( this.hasPush ) {
      if ( Not.permission === 'granted' ) {
        this.submitSubscription();
      } else {
        this.requestPermission().then( ( permission ) => {
          if ( permission === 'granted' ) {
            this.submitSubscription();
          }
        } );
      }
    }
  }

  private disablePushNotifications() {
    store.dispatch( 'clearPushSub' );
  }
}
</script>
