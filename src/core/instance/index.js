import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

//入口文件
function Vue (options) {
  //在node中，有全局变量process表示的是当前的node进程。process.env包含着关于系统环境的信息。但是process.env中并不存在NODE_ENV这个东西。NODE_ENV是用户一个自定义的变量，在webpack中它的用途是判断生产环境或开发环境的依据的
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)  //如果开发环境下，直接执行了Vue()
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)  //_init方法这里没有，由initMixin方法加进来
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
