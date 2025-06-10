package JavaProjects.TicketMasterProject;

/**
 *
 */


public class Show {
    private String date;
    private String price;
    private int qty;
    private String performer;
    private String city;
    private String data;


    public Show(String date, String price, int qty, String performer, String city, String data) {
        this.date = date;
        this.price = price;
        this.qty = qty;
        this.performer = performer;
        this.city = city;
        this.data = data;
    }

    /**
     *
     * Correctly organizes output String when class object called
     *
     * @return organized String
     */
    public String toString(){
        String out = "";
        out += date + "\t" + price + "\t\t" + qty + "\t\t" + performer;
        for (int i = 0; i < 6-performer.length()/4; i++) {
            out += "\t";
        }
        out += city + "\n";
        return out;
    }


    public String getPerformer() {
        return performer;
    }

    public String getCity() {
        return city;
    }

    public String getPrice() {
        return price;
    }
}
