git log -n 1 --pretty=format:"{ \"hash\": \"%h\", \"subject\": \"%s\", \"time\": %ct000 }" > dist/metadata.json
