APPDIR = /opt/node/ciks

.PHONY: all test clean

test:
	@echo "Testing"
	cd $(APPDIR); node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha -x mongodb-ciks

deploy: test deploy_ciks deploy_mongodb memory
	@echo "Deploying..."

deploy_ciks:
	@echo "Deploying caching library"
	cd $(APPDIR); npm publish

deploy_mongodb:
	@echo "Deploying MongoDB storage for CIKS"
	cp $(APPDIR)/.npmrc $(APPDIR)/src/mongodb-ciks/.npmrc
	cd $(APPDIR)/src/mongodb-ciks; npm publish

deploy_memory:
	@echo "Deploying In-memory storage for CIKS"
	cp $(APPDIR)/.npmrc $(APPDIR)/src/memory-ciks/.npmrc
	cd $(APPDIR)/src/memory-ciks; npm publish
