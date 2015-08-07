APPDIR = /opt/node/ciks

.PHONY: all test clean

test:
	@echo "Testing"
	cd $(APPDIR); node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha

deploy: test deploy_ciks deploy_mongodb
	@echo "Deploying..."

deploy_ciks:
	@echo "Deploying caching library"
	cd $(APPDIR); npm publish

deploy_mongodb:
	@echo "Deploying MongoDB storage for CIKS"
	cp $(APPDIR)/.npmrc $(APPDIR)/mongodb-ciks/.npmrc
	cd $(APPDIR)/mongodb-ciks; npm publish

