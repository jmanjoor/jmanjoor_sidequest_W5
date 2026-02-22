## Project Title

## GBDA302 Week 5 Side Quest: Reflective Blob Platformer (Camera + JSON World)

## Authors

Starter code provided by Dr. Karen Cochrane and David Han
Modified and extended by Jowan Manjooran Jomon for the Week 5 Side Quest

---

## Description

This project builds on the earlier blob platformer framework and focuses on creating a reflective, meditative camera experience within a world larger than the screen.

The game uses JSON-defined levels to describe world size, platforms, player start position, physics parameters, and hidden interactive symbols. A smooth side-scrolling camera follows the player through the environment using slow interpolation and subtle motion to evoke calm pacing.

Small collectible symbols are distributed across the level and revealed gradually through exploration, encouraging the player to move slowly through the space rather than rush to an endpoint. When all symbols are discovered, the camera settles into a calmer state before transitioning to the next level, reinforcing a reflective tone.

A second level loads automatically after the first is completed, and the game ends in a quiet, non-abrupt finished state.

---

## Learning Goals

Learning Goals:

- - Load and parse level data from JSON in preload()
- - Define a world larger than the canvas and scroll through it using a camera system
- - Implement a smooth, side-scrolling camera with calm, meditative pacing
- - Use pacing and motion (slow lerp, subtle drift, pauses) to evoke emotion
- - Hide small interactive symbols for the camera and player to discover
- - Track discovery progress and trigger calm transitions on completion
- - Structure a p5.js project using multiple classes (WorldLevel, BlobPlayer, Camera2D)
- - Automatically advance between levels when completion conditions are met

---

## Assets

N/A

---

## GenAI

## Starter code was provided by Dr. Karen Cochrane and David Han. GenAI tools were used to support understanding of the starter code’s structure and class relationships, assist with debugging camera behavior and level progression logic, and clarify the implementation of JSON-based configuration files and collectible generation logic.
