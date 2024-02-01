

with import <nixpkgs> {};
with pkgs.python310Packages;

stdenv.mkDerivation {
  name = "node+python";

  buildInputs = [
    ffmpeg-full
    nodejs
    gdal
    geos
    pip
    cargo
    rustc
    vorbis-tools
    python310Full
    virtualenv
  ];
  
  LD_LIBRARY_PATH="${geos}/lib:${gdal}/lib";

  shellHook = ''
    SOURCE_DATE_EPOCH=$(date +%s)  # so that we can use python wheels
    YELLOW='\033[1;33m'
    NC="$(printf '\033[0m')"

    echo -e "''${YELLOW}Creating python environment...''${NC}"
    virtualenv --no-setuptools venv > /dev/null
    export PATH=$PWD/venv/bin:$PATH > /dev/null
    pip install -r requirements.txt > /dev/null
  '';
}
