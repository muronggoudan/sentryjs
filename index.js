import { Sentry } from './src/main';
// import Sentry from 'sentryjs';
import Vue from 'vue/dist/vue.min';

const sentryInstance = new Sentry({
	// apikey: 'xxx'
});

sentryInstance.installVuePlugin(Vue);

const createElm = function() {
	const elm = document.createElement('div');
  
  elm.id = 'app';
  document.body.appendChild(elm);
  
  return elm;
};

const createVue = function () {
	const elm = createElm();
  
  return new Vue({
    template: `<div @click="_click">{{'vueDataUndefined'}}<div>
    <div>
      <img src="nonexistentresource" />
    </div>
    `,
    methods: {
    	_click: function () {
        console.log(vueAsyncError);
      }
    }
  }).$mount(elm);
};

// vue test
createVue();

// window test
// console.log(someVarUndefined);

// async test
// window.onclick = function () {
//   console.log(asyncError);
// };

// xhr test
// var XHR = new XMLHttpRequest();
// XHR.open('GET', 'getNothing');
// XHR.send();
