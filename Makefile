my-commands:cmds

# ============================================================
#  Install Node.js 24, npm, and Yarn on Ubuntu
# ===========================================================


REQUIRED_NODE_MAJOR := 24

# ─── Full Setup ──────────────────────────────────────────────
install-frontend-requirements: install-node install-yarn
	@echo ""
	@echo "✅  All done! Node.js 24, npm, and Yarn are installed."
	@$(MAKE) versions

# ─── Node.js 24 + npm ────────────────────────────────────────
install-node:
	@REQUIRED=$(REQUIRED_NODE_MAJOR); \
	if command -v node > /dev/null 2>&1; then \
		CURRENT=$$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))"); \
		if [ "$$CURRENT" -ge "$$REQUIRED" ]; then \
			echo "⏭  Node.js v$$CURRENT is already installed and meets v$(REQUIRED_NODE_MAJOR) — skipping."; \
		else \
			echo "⚠️  Node.js v$$CURRENT found — upgrading to v$(REQUIRED_NODE_MAJOR)..."; \
			sudo apt update; \
			sudo apt install -y curl; \
			curl -fsSL https://deb.nodesource.com/setup_$(REQUIRED_NODE_MAJOR).x | sudo bash -; \
			sudo apt install -y nodejs; \
			echo "✅  Node.js upgraded to $$(node -v)."; \
		fi \
	else \
		echo ">>> Node.js not found — installing v$(REQUIRED_NODE_MAJOR)..."; \
		sudo apt update; \
		sudo apt install -y curl; \
		curl -fsSL https://deb.nodesource.com/setup_$(REQUIRED_NODE_MAJOR).x | sudo bash -; \
		sudo apt install -y nodejs; \
		echo "✅  Node.js $$(node -v) and npm $$(npm -v) installed."; \
	fi

# ─── Yarn ────────────────────────────────────────────────────
install-yarn:
	@if command -v yarn > /dev/null 2>&1; then \
		echo "⏭  Yarn is already installed: $$(yarn -v) — skipping."; \
	else \
		echo ">>> Enabling Corepack..."; \
		sudo corepack enable; \
		echo ">>> Installing latest stable Yarn..."; \
		corepack prepare yarn@stable --activate; \
		echo "✅  Yarn installed."; \
	fi

# ─── Versions ────────────────────────────────────────────────
versions:
	@echo ""
	@echo "  Node.js : $$(node -v)"
	@echo "  npm     : $$(npm -v)"
	@echo "  Yarn    : $$(yarn -v)"
	@echo ""

# ─── Uninstall ───────────────────────────────────────────────
uninstall-frontend:
	@echo ">>> Removing Node.js and npm..."
	sudo apt remove -y nodejs
	sudo apt autoremove -y
	sudo rm -f /etc/apt/sources.list.d/nodesource.list
	@echo ">>> Removing Yarn (Corepack)..."
	sudo corepack disable || true
	@echo ">>> Uninstall complete."

blog-react-build:
	@cd /home/Projects/blog_react && sudo rm -rf node_modules && sudo rm -rf dist && yarn install && yarn run build
	@echo "All react projects clean and build completed\n"
	

docker-install:
	@docker --version || ( \
		sudo apt-get update; \
		sudo apt-get install -y ca-certificates curl; \
		sudo install -m 0755 -d /etc/apt/keyrings; \
		sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc; \
		sudo chmod a+r /etc/apt/keyrings/docker.asc; \
		echo "deb [arch=$$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $$(. /etc/os-release && echo "$$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null; \
		echo "Docker installed successfully\n"; \
	)

docker-compose-install: 
	@docker-compose version || ( \
		sudo apt-get update && sudo apt-get install -y; \
		sudo apt install -y curl jq; \
		sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$$(uname -s)-$$(uname -m)" -o /usr/local/bin/docker-compose; \
		sudo chmod +x /usr/local/bin/docker-compose; \
		echo "docker-compose version- $$(docker-compose --version)"; \
		echo "docker-compose installed successfully"; \
	)

install: docker-install docker-compose-install
	@echo "Docker and docker-compose Installation completed\n"


docker-compose-build:
	@docker-compose build --no-cache

docker-compose-up:
	@docker-compose up -d
	@docker image prune -a -f

docker-compose-down:
	@docker-compose down

nginx-restart:
	sudo systemctl reload nginx

docker-build: docker-compose-build
	@echo "Docker compose build completed."

docker-up: docker-compose-up
	@echo "Docker compose up completed."

docker-down: docker-compose-down
	@echo "Docker compose down completed."

docker-compose-restart: install-frontend-requirements blog-react-build docker-compose-down docker-compose-build docker-compose-up nginx-restart
	@echo "Docker compose restarted."

docker-clean:
	@docker ps -a -q  ||  docker stop $$(docker ps -a -q)
	@docker ps || docker container rm -f $$(docker container ls -aq)
	@docker images  || docker image rm -f $$(docker image ls -aq)
	@docker container prune -f
	@docker image prune -f
	@docker volume prune -f
	@docker network prune -f
	@yes | docker system prune -a

cmds:
	@echo "Available commands:"
	@echo "  make blog-react-build - to build the blog react app"
	@echo "  make docker-build - to build the docker compose"
	@echo "  make docker-up - to start the docker compose"
	@echo "  make docker-down - to stop the docker compose"
	@echo "  make docker-clean - to clean the docker images, containers, volumes and networks"
	@echo "  make docker-compose-restart - to restart the docker compose"
	@echo "    install-frontend-requirements     Install Node.js 24, npm, and Yarn (full setup)"
	@echo "    install-node    Install Node.js 24 and npm"
	@echo "    install-yarn    Install Yarn (requires Node.js already installed)"
	@echo "    versions        Print installed versions"
	@echo "    uninstall-frontend    Remove Node.js, npm, and Yarn"
