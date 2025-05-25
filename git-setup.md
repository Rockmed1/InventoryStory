# google sheet cheat sheet

https://docs.google.com/spreadsheets/d/1hj-tZLMMGsrG_tpnBaTObgBn2icFiZqVcJXH1GJNaDk/edit?pli=1&gid=0#gid=0

# initialize git

git init

# configure git

git config --global user.name Rockmed1
git config --global user.email 186123210+Rockmed1@users.noreply.github.com

git config --global init.defaultBranch <main>

## rename a branch

git branch -m <name>

# add to staging area

git add -A

# Remove from staging area

git rm --cached -r . <or_file_name>

# get status of staging area

git status

# Commit changes to local repository

git commit -m 'inital commit'

# roll back local commits:

## to the latest version that was committed

ter
git reset --hard HEAD

## to the remote repository

git reset --hard origin/main

# see a log of commits

git log
Q => to quit the log screen

# see a list of branches. the one with the \* is the CURRENT branch

git branch
Q => to quit the branch screen

# create a branch

git branch branchName

# switch to another branch

git checkout branchName

# merge branches

git merge branchName

### always work in a separate branch and merge to the main branch when done(dev&testing)

# CREATE a REPOSITORY ON GITHUB

# create a remote branch with the name origin

git remote add origin https://github.com/Rockmed1/forkify-js-course.git

# push the local repository to github:

## push the main branch to the remote repository origin

git push origin main

## or you can also push the other local branches

git push origin new-feature
