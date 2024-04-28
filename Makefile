NAME=weather

.PHONY: compile install

compile: schemas/org.gnome.shell.extensions.$(NAME).gschema.xml
	glib-compile-schemas schemas/

install: compile
	rm -rf ~/.local/share/gnome-shell/extensions/weather@matejbuocik
	mkdir ~/.local/share/gnome-shell/extensions/weather@matejbuocik
	cp -r . ~/.local/share/gnome-shell/extensions/weather@matejbuocik
