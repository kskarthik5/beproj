{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
   name = "cuda-env-shell";
   buildInputs = with pkgs; [
     git gitRepo gnupg autoconf curl
     procps gnumake util-linux m4 gperf unzip
     cudatoolkit linuxPackages.nvidia_x11
     libGLU libGL
     xorg.libXi xorg.libXmu freeglut
     xorg.libXext xorg.libX11 xorg.libXv xorg.libXrandr zlib 
     ncurses5 stdenv.cc binutils
     ffmpeg-full
     nodejs
     gdal
     geos
     cargo
     rustc
     vorbis-tools
     python310Full
     virtualenv
     python310Packages.pip
     python310Packages.numpy
     python310Packages.pytorch-bin
     python310Packages.virtualenv
     cudaPackages.cudnn
   ];
  checkInputs = [ pkgs.xterm ];
  checkPhase = ''
    xterm -e make check
  '';
   shellHook = ''
      export CUDA_PATH=${pkgs.cudatoolkit}
      export LD_LIBRARY_PATH=${pkgs.linuxPackages.nvidia_x11}/lib:${pkgs.ncurses5}/lib:"${pkgs.geos}/lib:${pkgs.gdal}/lib
      export EXTRA_LDFLAGS="-L/lib -L${pkgs.linuxPackages.nvidia_x11}/lib"
      export EXTRA_CCFLAGS="-I/usr/include"
      SOURCE_DATE_EPOCH=$(date +%s)  # so that we can use python wheels
      YELLOW='\033[1;33m'
      NC="$(printf '\033[0m')"
  
      echo -e "''${YELLOW}Creating python environment...''${NC}"
      virtualenv --no-setuptools venv > /dev/null
      export PATH=$PWD/venv/bin:$PATH > /dev/null
      pip install -r requirements.txt > /dev/null
      source $PWD/venv/bin/activate
   '';          
}


