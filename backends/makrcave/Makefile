AL=alembic -c alembic.ini

.PHONY: migrate revision downgrade current history

migrate:
	$(AL) upgrade head

revision:
	@test -n "$(m)" || (echo "Usage: make revision m=\"message\"" && exit 1)
	$(AL) revision --autogenerate -m "$(m)"

downgrade:
	$(AL) downgrade -1

current:
	$(AL) current

history:
	$(AL) history --verbose

.PHONY: seed
seed:
	python seed.py
