// 配置文件
// @author muronggoudan
// @date 2018-07-20

export default {

  // 版本信息
  // 用于平台信息展示兼容
	version: '1.0.1',
  
  // 模块默认使能开关
	sentryGlobalConfig: {
    enable:   true,
		window:   true,
		http:     true,
		xhr:      true,
    promise:  true,
	},
  
  // 上报错误类型字典
	typeDict: {
		diy:      '000',
		window:   '001',
		http:     '002',
		xhr:      '003',
		vue:      '004',
		promise:  '005',
  },

  // 等待时间
  delay: 1000,
  
}