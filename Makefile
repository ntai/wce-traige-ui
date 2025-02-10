.PHONY: ship build local

node_modules:
	npm install

build: node_modules
	python3 generate_manifest.py
	npm run build

ship: build local
	cd build && tar czf ../wce-triage-ui.tgz *
	curl -u triage:thepasswordiswcetriage -T wce-triage-ui.tgz https://www.release.cleanwinner.com/wce/

local:
	sudo rsync -av --delete /home/ntai/sand/wce-triage-ui/build/ /usr/local/share/wce/wce-triage-ui/
	sudo mount /dev/nvme1n1p2 /triage
	sudo rsync -av --delete /home/ntai/sand/wce-triage-ui/build/ /triage/usr/local/share/wce/wce-triage-ui/
	sudo umount /dev/nvme1n1p2
