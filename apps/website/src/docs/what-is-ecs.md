# What is ECS?

ECS — short for "Entity Component System" — is **an architectural approach to managing entities in games and similarly demanding applications**. Similar to other architecture paradigms such as MVC ("Model View Controller"), ECS is a way of structuring your code to make it easier to reason about and maintain. In a lot of situations, it can also yield significant performance benefits.

## Let's Design a Game

Okay, okay, let's take a couple of steps back and talk about how games work. A game typically consists of a large chunk of code that is executed every frame. This code usually performs a series of tasks, like:

- Fetch the user's input
- Update the game state
- Render the game state

**Game state** usually revolves around a set of objects that can exist during gameplay, and interact with other objects. These might be:

- The player's spaceship
- A number of enemy spaceships
- Bullets fired by the player or the enemies
- Power-ups dropped by destroyed enemies that can be picked up by the player

Planning our next great space shooter, let's go into a little more detail and think about how these objects might **behave** in our game:

- When the player presses a cursor key, their spaceship should move in the corresponding direction
- When the player presses the space bar, a bullet should be fired
- Enemies should move towards the player's spaceship
- When in range, enemies should fire bullets at the player's spaceship
- When a bullet hits an enemy, the enemy should lose health
- When an enemy loses all of its health, it should be destroyed
- When an enemy is destroyed, it should drop a power-up
- When the player picks up a power-up, the player should gain a certain effect
- When the player's spaceship is hit, the player should lose a certain amount of health
- When the player's health reaches zero, the game should end

If you look closely, you will find that there is some significant overlap between these. For example, we will be dealing with:

- Things that can move (spaceships, bullets)
- Things that can be destroyed (spaceships, bullets, enemies, power-ups)
- Things that have health that needs to be depleted before they are destroyed (spaceships, enemies)
- Things that can be picked up by the player (power-ups)

And **this is where ECS comes in**. Instead of looping over every individual _type of game object_, we can now create a series of code units that each performs one of these pieces of logic. The part of our game loop that updates game state may now look like this:

- Fetch the user's input
- Change the player ship's velocity based on input
- For all enemy spaceships, update their velocity based on the player's position
- For all entities that can move, update their positions based on their velocities
- For all entities that can move, check if they are colliding with other entities
- For all entities that are colliding and have health, reduce their health
- For all entities that have health, destroy them if their health is depleted
- For all enemy entities that are destroyed, spawn a power-up
- Update the player's stats based on the power-ups they have picked up

You will see a pattern here: fetch a subset of all game **entities**, based on which **components** they have, and run some code on them (the **system**.)
