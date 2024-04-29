{
  description = "Python 3.10 development environment";
  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs {
        inherit system;
        config.allowUnfree = true;
        config.cudaSupport = true;
      };
    in {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          cudatoolkit
          linuxPackages.nvidia_x11
          cudaPackages.cudnn
          libGLU
          libGL
          xorg.libXi
          xorg.libXmu
          freeglut
          xorg.libXext
          xorg.libX11
          xorg.libXv
          xorg.libXrandr
          zlib
          ncurses5
          stdenv.cc
          binutils
          ffmpeg-full
          nodejs
          gdal
          geos
          cargo
          rustc
          vorbis-tools
          python310
          python310Packages.pip
          python310Packages.numpy
          python310Packages.pytorch-bin
          python310Packages.virtualenv
        ];

        shellHook = ''
          export LD_LIBRARY_PATH="${pkgs.geos}/lib:${pkgs.gdal}/lib:${pkgs.linuxPackages.nvidia_x11}/lib:${pkgs.linuxPackages.nvidia_x11}/lib"
          SOURCE_DATE_EPOCH=$(date +%s)  # so that we can use python wheels
          YELLOW='\033[1;33m'
          NC="$(printf '\033[0m')"
          echo -e "''${YELLOW}Creating python environment...''${NC}"
          virtualenv --no-setuptools venv > /dev/null
          export PATH=$PWD/venv/bin:$PATH > /dev/null
          pip install -r requirements.txt > /dev/null
          source $PWD/venv/bin/activate
        '';
      };
    };
}
