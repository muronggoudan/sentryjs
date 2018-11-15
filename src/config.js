export default {

	version: '1.0.0',
	
	protocol: 'https',
	
	serverIP: '10.35.93.100',
	
	httpServerPort: '8089',
	
	httpsServerPort: '8090',
	
	path: '/overseaFE/record/save',
	
	sentryGlobalConfig: {
		enable:   true,
		window:   true,
		http:     true,
		xhr:      true,
		vue:      true,
	},
	
	typeDict: {
		diy:      '000',
		window:   '001',
		http:     '002',
		xhr:      '003',
		vue:      '004',
		promise:  '005',
  }
  
}