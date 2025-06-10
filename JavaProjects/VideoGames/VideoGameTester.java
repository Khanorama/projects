package JavaProjects.VideoGames;

import java.util.ArrayList;

public class VideoGameTester {
    public static void main(String[] args) throws InterruptedException {
        ArrayList<VideoGame> games = new ArrayList<>();
        games.add(new VideoGame("GenericVideoGame", 2, 100));
        games.add(new Minecraft(1));
        games.add(new RobloxGame("GenericRobloxGame", "Standard Roblox ToS",
                135617, 200));
        games.add(new Deepwoken(2000));
        for (VideoGame game : games) {
            System.out.println(game + "\n");
        }

        for (VideoGame game : games) {
            game.startGame();
        }

        for (VideoGame game : games) {
            System.out.println(game + "\n");
        }

    }
}
