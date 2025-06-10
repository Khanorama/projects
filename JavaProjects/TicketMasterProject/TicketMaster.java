package JavaProjects.TicketMasterProject;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Scanner;

import static java.lang.Double.parseDouble;

/**
 *
 */

public class TicketMaster {
    private  ArrayList<Show> shows;
    private static Scanner str;

    public TicketMaster() throws FileNotFoundException{
        str = new Scanner(new File("UpdatedTicketListWithNewShows.txt"));
        shows = new ArrayList<Show>();
        qReader();
    }


    /**
     * Reads data from text file and converts it into an ArrayList of Show objects
     */
    public void qReader(){
        while (str.hasNextLine()) {
            String s = new String(str.nextLine());
            int count = 0;
            int spaces = 0;
            String date = "";
            String price = "";
            int qty = 0;
            String performer = "";
            String city = "";
            for (int i = 0; i < s.length(); i++) {
                if (spaces == 3) i = s.length();
                else if (s.charAt(i) == ' ') {
                    if (spaces == 0) {
                        date = s.substring(count, i).trim();
                        count = i;
                        spaces++;
                    } else if (spaces == 1) {
                        price = s.substring(count, i).trim();
                        count = i;
                        spaces++;
                    } else if (spaces == 2) {
                        qty = Integer.parseInt(s.substring(count+1, i).trim());
                        count = i;
                        spaces++;
                    }
                }
            }
            for (int i = count + 1; i < s.length(); i++) {
                if (i == s.length() - 1) {
                    city = s.substring(count + 1, i + 1).trim();
                    count = i;
                } else if (s.charAt(i) == ',') {
                    performer = s.substring(count + 1, i).trim();
                    count = i;
                }
            }
            Show show = new Show(date, price, qty, performer, city, s);
            shows.add(show);
        }
        str.close();
    }


    /**
     *
     * searches for given city in ArrayList of shows, and adds matching to new ArrayList which is returned
     *
     * @param city City being searched for
     * @return ArrayList of matching cities
     */
    public ArrayList<Show> citySearch(String city){
        ArrayList<Show> results = new ArrayList<>();
        for (Show show : shows){
            if (show.getCity().equalsIgnoreCase(city)) results.add(show);
        }
        return results;
    }

    /**
     *
     * Sorts all shows in ArrayList alphabetically using Selection sort
     *
     * @return sorted ArrayList
     */
    public ArrayList<Show> alphaSort(){
        for (int i = 0; i < shows.size()-1; i++) {
            int minIndex = i;
            for (int j = i+1; j < shows.size(); j++) {
                if (shows.get(minIndex).getPerformer().compareTo(shows.get(j).getPerformer()) > 0) minIndex = j;
            }
            Show temp = shows.get(i);
            shows.set(i, shows.get(minIndex));
            shows.set(minIndex, temp);
        }
        return shows;
    }

    /**
     *
     * Sorts all shows in ArrayList reverse alphabetically using Selection sort
     *
     * @return sorted ArrayList
     */
    public ArrayList<Show> alphaSortReverse(){
        for (int i = 0; i < shows.size()-1; i++) {
            int minIndex = i;
            for (int j = i+1; j < shows.size(); j++) {
                if (shows.get(minIndex).getPerformer().compareTo(shows.get(j).getPerformer()) < 0) minIndex = j;
            }
            Show temp = shows.get(i);
            shows.set(i, shows.get(minIndex));
            shows.set(minIndex, temp);
        }
        return shows;
    }

    /**
     *
     * Sorts all shows in ArrayList by increasing price order using Insertion sort
     *
     * @return sorted ArrayList
     */
    public ArrayList<Show> priceLowHigh(){
        for (int i = 1; i < shows.size(); i++) {
            Show tempVal = shows.get(i);
            int currPos = i;
            while (currPos > 0 && parseDouble(shows.get(currPos - 1).getPrice()) > parseDouble(tempVal.getPrice())){
                shows.set(currPos, shows.get(currPos - 1));
                currPos--;
            }
            shows.set(currPos, tempVal);
        }
        return shows;
    };

    /**
     *
     * Sorts all shows in ArrayList by decreasing price order using Insertion sort
     *
     * @return sorted ArrayList
     */
    public ArrayList<Show> priceHighLow(){
        for (int i = 1; i < shows.size(); i++) {
            Show tempVal = shows.get(i);
            int currPos = i;
            while (currPos > 0 && parseDouble(shows.get(currPos - 1).getPrice()) < parseDouble(tempVal.getPrice())){
                shows.set(currPos, shows.get(currPos - 1));
                currPos--;
            }
            shows.set(currPos, tempVal);
        }
        return shows;
    };

    /**
     * Prints menu options for selection
     */
    public void printMenu(){
     System.out.println("""




               Choose from the following options:


               \t1. Sort Alphabetically (A-Z)
               \t2. Sort Alphabetically (Z-A)
               \t3. Sort By Price ($ - $$$$$)
               \t4. Sort By Price ($$$$$ - $)
               \t5. Search for a City
               \t6. QUIT


               Enter a number from 1 - 6:""");
    }

    /**
     * Prints out names for categories when data is displayed
     */
    public void formatter(){
        System.out.println("Date:\t\t Price:\t\tQty:\tPerformer:\t\t\t\t City:\n" +
                "--------------------------------------------------------------------");
    }

    /**
     *
     * Correctly organizes output String when class object called
     *
      * @return organized String
     */
    public String toString(){
        String out = "";
        out += "Date:\t\t Price:\t\tQty:\tPerformer:\t\t\t\t City:\n";
        out += "--------------------------------------------------------------------\n";
        for (Show show : shows) out += show;
        return out;
    }
}
