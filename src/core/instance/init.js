/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

//初始化时真正执行的函数
export function initMixin (Vue: Class<Component>) {
  //初始化时执行的函数，options是new vue({这里的东西})
  Vue.prototype._init = function (options?: Object) {
    //vm vue的实例
    const vm: Component = this
    // 执行一次new Vue，新的Vue实例的_uid就会与之前不一样，而且加1
    vm._uid = uid++

    let startTag, endTag
    //如果是开发模式下，而且开启了记录性能，
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    vm._isVue = true

    if (options && options._isComponent) { //如果有option，而且配置里_isComponent为true
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor), //vm.constructor就是vue的原型
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  //看上去这里没有对data进行处理，而且主要是针对options的parent，进行的初始化

  //这里把vue类的默认options拿了过来
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode

  opts.parent = options.parent
  opts._parentVnode = parentVnode //用到参数options

  const vnodeComponentOptions = parentVnode.componentOptions //用到参数options

  opts.propsData = vnodeComponentOptions.propsData //用到参数options
  opts._parentListeners = vnodeComponentOptions.listeners //用到参数options
  opts._renderChildren = vnodeComponentOptions.children //用到参数options
  opts._componentTag = vnodeComponentOptions.tag //用到参数options

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions (Ctor: Class<Component>) { //Ctor就是vue的原型
  let options = Ctor.options
  //如果vue继承了某些父类的话
  if (Ctor.super) { 
    const superOptions = resolveConstructorOptions(Ctor.super)
    //获取vue的原型的superOptions
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      Ctor.superOptions = superOptions
      //获取Ctor.options与Ctor.sealedOptions的差异，以Ctor.options为准
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        //把modifiedOptions合到Ctor.extendOptions
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions) //Ctor.options来源
      if (options.name) {
        options.components[options.name] = Ctor  //options:{components:{test:Ctor},name:'test'}
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object { //Ctor就是vue的原型
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
