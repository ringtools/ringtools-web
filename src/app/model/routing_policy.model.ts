export type RoutingPolicy = {
    time_lock_delta: Number;
    min_htlc: Number;
    fee_base_msat: Number;
    fee_rate_milli_msat: Number;
    disabled: boolean;
    max_htlc_msat: Number;
    last_update: Number;
}