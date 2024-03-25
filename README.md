
# Pre-requisites

Install ```nix```

# Usage

## Set a bot token (see config.example.json)
```cp config.example.json config.json```

 ```nano config.json```
## Enter development environment
```NIXPKGS_ALLOW_UNFREE=1 nix-shell --impure```

## Start the bot!
```npm start```
