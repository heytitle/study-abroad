#!/usr/bin/env bash

SRC="https://docs.google.com/spreadsheets/d/e/2PACX-1vQs55ONzdxklV4E9uCHJ1kfsAuxFGUaLNMLU0nt5LMFtKZkMFQiY1Ux-UZzFqyO0r55VtLGg7zGDPbp/pub?gid=0&single=true&output=csv"

curl $SRC -o ./src/data/summer-schools.csv