# For fast builds, "make debug"

MAJOR_VERSION=0
SUBVERSION=1
VAR=$(shell date +%s)
SECONDS=$(shell echo $(VAR) \- 1542127842 | bc) #From time project major version began
HEX_SECONDS=$(shell printf "%x" ${SECONDS})
VERSION=${MAJOR_VERSION}.${SUBVERSION}.${HEX_SECONDS}
ODIR=bin
LDIR=
IDIR=api
IDIR2=app
CC=emcc
OPT=3

debug: OPT=0

CFLAGS=-I$(IDIR) -I$(IDIR2) -O$(OPT) -Wno-shift-negative-value -s DISABLE_DEPRECATED_FIND_EVENT_TARGET_BEHAVIOR=0

debug: CFLAGS+=-g3

SRC_FILES := $(wildcard $(IDIR)/*.cpp)
OBJ_FILES := $(patsubst $(IDIR)/%.cpp,$(ODIR)/%.o,$(SRC_FILES))

SRC_FILES2 := $(wildcard $(IDIR2)/*.cpp)
HTML_FILES := $(patsubst $(IDIR2)/%.cpp,$(ODIR)/%.html,$(SRC_FILES2))

all: directories $(OBJ_FILES) $(HTML_FILES) clean
debug: all

###########################
# Make directories
###########################

MKDIR_P = mkdir -p

directories: $(ODIR)

$(ODIR):
	$(MKDIR_P) $(ODIR)

###########################
# Make version file
###########################

version:
	echo "#define APP_VERSION \"$(VERSION)\"" > $(IDIR)/Version.h; \

###########################
# Make library
###########################

$(ODIR)/%.o: $(IDIR)/%.cpp
	$(CC) $(CFLAGS) -c -o $@ $<

##########################
# Make apps
##########################

$(ODIR)/%.html: $(IDIR2)/%.cpp
	$(CC) $(CFLAGS) -o $@ $^ $(OBJ_FILES) -s FETCH=1

###########################
# Make clean
###########################

clean:
	@rm -f $(ODIR)/*.o $(ODIR)/*.html || true && echo "Deleting generated .o and .html files\nDone"